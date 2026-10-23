// services/metricasServidor.js
// Métricas técnicas en memoria para el panel del superadmin: tiempos de
// respuesta, códigos de estado y rutas más lentas. Se reinician cuando el
// servidor se reinicia (un despliegue nuevo, por ejemplo).
const VENTANA_MS = 60 * 60 * 1000; // la última hora
const MAX_MUESTRAS = 20000;

const inicio = Date.now();
let muestras = []; // { t, ms, status, ruta, metodo }
let totalDesdeInicio = 0;

// "/api/lugares/12" → "/api/lugares/:id", para agrupar por ruta
const normalizarRuta = (url) => url.split('?')[0]
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    .replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,}(?=\/|$)/gi, '/:uuid')
    .replace(/\/CEM-[A-Z0-9]+/g, '/:codigo');

function middlewareMetricas(req, res, next) {
    const t0 = process.hrtime.bigint();
    res.on('finish', () => {
        if (req.method === 'OPTIONS') return;
        const ms = Number(process.hrtime.bigint() - t0) / 1e6;
        totalDesdeInicio++;
        muestras.push({ t: Date.now(), ms, status: res.statusCode, ruta: normalizarRuta(req.originalUrl), metodo: req.method });
        if (muestras.length > MAX_MUESTRAS) muestras = muestras.slice(-MAX_MUESTRAS / 2);
    });
    next();
}

const percentil = (ordenados, p) => (ordenados.length ? ordenados[Math.min(ordenados.length - 1, Math.floor((p / 100) * ordenados.length))] : 0);
const redondear = (n) => Math.round(n * 10) / 10;

function resumenPeticiones() {
    const ahora = Date.now();
    muestras = muestras.filter((m) => ahora - m.t <= VENTANA_MS);
    const tiempos = muestras.map((m) => m.ms).sort((a, b) => a - b);
    const ultimos5 = muestras.filter((m) => ahora - m.t <= 5 * 60 * 1000).length;

    const porRuta = {};
    for (const m of muestras) {
        const clave = `${m.metodo} ${m.ruta}`;
        const r = (porRuta[clave] ||= { ruta: clave, peticiones: 0, total_ms: 0, max_ms: 0, errores: 0 });
        r.peticiones++;
        r.total_ms += m.ms;
        r.max_ms = Math.max(r.max_ms, m.ms);
        if (m.status >= 500) r.errores++;
    }
    const rutas = Object.values(porRuta).map((r) => ({
        ruta: r.ruta, peticiones: r.peticiones, errores: r.errores,
        promedio_ms: redondear(r.total_ms / r.peticiones), max_ms: redondear(r.max_ms),
    }));

    const codigos = {};
    for (const m of muestras) {
        const grupo = `${Math.floor(m.status / 100)}xx`;
        codigos[grupo] = (codigos[grupo] || 0) + 1;
    }

    // Serie por minuto de los últimos 30 minutos (peticiones y latencia media)
    const serie = [];
    for (let i = 29; i >= 0; i--) {
        const desde = ahora - (i + 1) * 60000;
        const hasta = ahora - i * 60000;
        const del_minuto = muestras.filter((m) => m.t > desde && m.t <= hasta);
        serie.push({
            minuto: new Date(hasta).toISOString(),
            peticiones: del_minuto.length,
            promedio_ms: del_minuto.length ? redondear(del_minuto.reduce((a, m) => a + m.ms, 0) / del_minuto.length) : 0,
        });
    }

    return {
        desde_inicio: totalDesdeInicio,
        ultima_hora: muestras.length,
        por_minuto_5min: redondear(ultimos5 / 5),
        latencia_ms: {
            promedio: tiempos.length ? redondear(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0,
            p50: redondear(percentil(tiempos, 50)),
            p95: redondear(percentil(tiempos, 95)),
            p99: redondear(percentil(tiempos, 99)),
        },
        tasa_error_5xx: muestras.length ? redondear(((codigos['5xx'] || 0) / muestras.length) * 100) : 0,
        codigos,
        rutas_mas_lentas: [...rutas].sort((a, b) => b.promedio_ms - a.promedio_ms).slice(0, 8),
        rutas_mas_usadas: [...rutas].sort((a, b) => b.peticiones - a.peticiones).slice(0, 8),
        serie,
    };
}

module.exports = { middlewareMetricas, resumenPeticiones, inicioServidor: inicio };
