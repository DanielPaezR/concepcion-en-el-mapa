// controllers/comercioController.js
const pool = require('../config/database');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');
const CodigoDescuento = require('../models/CodigoDescuento');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const comercioController = {
    // GET /api/comercios — público, para el mapa del turista. Solo activos.
    async getAll(req, res) {
        try {
            const result = await pool.query(`
                SELECT c.id, c.nombre, c.categoria, c.descripcion, c.beneficio,
                       c.latitud, c.longitud, c.direccion, c.imagen_portada_url,
                       COALESCE(AVG(r.calificacion), 0)::numeric(3,2) AS calificacion_promedio,
                       COUNT(DISTINCT r.id) AS total_resenas
                FROM comercios c
                LEFT JOIN resenas_comercio r ON r.comercio_id = c.id
                WHERE c.activo = true
                GROUP BY c.id
                ORDER BY c.nombre
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Error al listar comercios:', error);
            res.status(500).json({ error: 'Error al listar comercios' });
        }
    },

    // GET /api/comercios/:id — ficha pública de un comercio (fotos, reseñas)
    async getById(req, res) {
        try {
            const { id } = req.params;

            const comercioResult = await pool.query(`
                SELECT c.*,
                       COALESCE(AVG(r.calificacion), 0)::numeric(3,2) AS calificacion_promedio,
                       COUNT(DISTINCT r.id) AS total_resenas
                FROM comercios c
                LEFT JOIN resenas_comercio r ON r.comercio_id = c.id
                WHERE c.id = $1 AND c.activo = true
                GROUP BY c.id
            `, [id]);

            if (comercioResult.rows.length === 0) {
                return res.status(404).json({ error: 'Comercio no encontrado' });
            }

            const fotosResult = await pool.query(
                'SELECT id, imagen_url, orden FROM comercio_fotos WHERE comercio_id = $1 ORDER BY orden, id',
                [id]
            );

            const resenasResult = await pool.query(`
                SELECT r.id, r.calificacion, r.comentario, r.fecha_creacion, u.nombre AS turista_nombre
                FROM resenas_comercio r
                JOIN usuarios u ON r.usuario_id = u.id
                WHERE r.comercio_id = $1
                ORDER BY r.fecha_creacion DESC
                LIMIT 20
            `, [id]);

            res.json({
                ...comercioResult.rows[0],
                fotos: fotosResult.rows,
                resenas: resenasResult.rows
            });
        } catch (error) {
            console.error('Error al obtener comercio:', error);
            res.status(500).json({ error: 'Error al obtener comercio' });
        }
    },

    // POST /api/comercios/admin — solo admin. Crea la cuenta de usuario
    // (rol comercio) Y el perfil del negocio en un solo paso.
    async crearComercioAdmin(req, res) {
        try {
            const { email, password, nombre_dueno, nombre, categoria, descripcion, beneficio, latitud, longitud, direccion } = req.body;

            if (!email || !password || !nombre || !categoria || !beneficio) {
                return res.status(400).json({ error: 'email, password, nombre, categoria y beneficio son requeridos' });
            }

            const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
            if (existe.rows.length > 0) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const usuarioResult = await pool.query(`
                INSERT INTO usuarios (email, nombre, password_hash, rol)
                VALUES ($1, $2, $3, 'comercio')
                RETURNING id, email, nombre
            `, [email, nombre_dueno || nombre, passwordHash]);

            const usuarioId = usuarioResult.rows[0].id;

            const comercioResult = await pool.query(`
                INSERT INTO comercios (usuario_id, nombre, categoria, descripcion, beneficio, latitud, longitud, direccion)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [usuarioId, nombre, categoria, descripcion || null, beneficio, latitud || null, longitud || null, direccion || null]);

            res.status(201).json({
                success: true,
                usuario: usuarioResult.rows[0],
                comercio: comercioResult.rows[0]
            });
        } catch (error) {
            console.error('Error creando comercio:', error);
            res.status(500).json({ error: 'Error creando comercio' });
        }
    },

    // GET /api/comercios/mi-negocio — el dueño ve su propio perfil completo
    async miNegocio(req, res) {
        try {
            const comercioId = req.user.comercio_id;
            if (!comercioId) {
                return res.status(403).json({ error: 'Esta cuenta no tiene un comercio asociado' });
            }

            const result = await pool.query('SELECT * FROM comercios WHERE id = $1', [comercioId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Comercio no encontrado' });
            }

            const fotos = await pool.query(
                'SELECT id, imagen_url, orden FROM comercio_fotos WHERE comercio_id = $1 ORDER BY orden, id',
                [comercioId]
            );

            res.json({ ...result.rows[0], fotos: fotos.rows });
        } catch (error) {
            console.error('Error al obtener mi negocio:', error);
            res.status(500).json({ error: 'Error al obtener mi negocio' });
        }
    },

    // GET /api/comercios/mi-negocio/recuerdos — cola de fotos-recuerdo
    // asignadas a este comercio para imprimir. Hoy siempre devolverá una
    // lista vacía (todavía no existe el mecanismo que asigna un recuerdo a
    // un comercio específico), pero el endpoint queda listo para cuando
    // se construya esa asignación en la fase 2 (impresora física).
    async misRecuerdosPendientes(req, res) {
        try {
            const comercioId = req.user.comercio_id;
            if (!comercioId) {
                return res.status(403).json({ error: 'Esta cuenta no tiene un comercio asociado' });
            }

            const result = await pool.query(`
                SELECT ar.id, ar.imagen_url, ar.estado, ar.fecha_creacion, l.nombre AS lugar_nombre
                FROM archivos_recuerdo ar
                LEFT JOIN lugares l ON ar.lugar_id = l.id
                WHERE ar.comercio_id = $1
                ORDER BY ar.fecha_creacion DESC
            `, [comercioId]);

            res.json(result.rows);
        } catch (error) {
            console.error('Error al listar recuerdos pendientes:', error);
            res.status(500).json({ error: 'Error al listar recuerdos pendientes' });
        }
    },

    // PUT /api/comercios/mi-negocio — el dueño edita su propio perfil
    // (nombre, descripción, beneficio, foto de portada). Nunca puede
    // editar el de otro: el id sale del token, no del body.
    async actualizarMiNegocio(req, res) {
        try {
            const comercioId = req.user.comercio_id;
            if (!comercioId) {
                return res.status(403).json({ error: 'Esta cuenta no tiene un comercio asociado' });
            }

            const { nombre, descripcion, beneficio, direccion } = req.body;

            let imagenPortadaUrl = null;
            if (req.file) {
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'concepcion_comercios', transformation: [{ width: 800, height: 600, crop: 'limit' }] },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });
                imagenPortadaUrl = result.secure_url;
            }

            const result = await pool.query(`
                UPDATE comercios
                SET nombre = COALESCE($1, nombre),
                    descripcion = COALESCE($2, descripcion),
                    beneficio = COALESCE($3, beneficio),
                    direccion = COALESCE($4, direccion),
                    imagen_portada_url = COALESCE($5, imagen_portada_url),
                    fecha_actualizacion = NOW()
                WHERE id = $6
                RETURNING *
            `, [nombre, descripcion, beneficio, direccion, imagenPortadaUrl, comercioId]);

            res.json({ success: true, comercio: result.rows[0] });
        } catch (error) {
            console.error('Error actualizando comercio:', error);
            res.status(500).json({ error: 'Error actualizando comercio' });
        }
    },

    // GET /api/comercios/codigos/:codigo — revisa un código SIN marcarlo
    // como usado, para que el dueño del negocio vea de qué se trata antes
    // de confirmar el canje.
    async validarCodigo(req, res) {
        try {
            const { codigo } = req.params;
            const codigoInfo = await CodigoDescuento.buscarPorCodigo(codigo.toUpperCase());

            if (!codigoInfo) {
                return res.status(404).json({ valido: false, error: 'Código no existe' });
            }

            if (codigoInfo.usado) {
                return res.status(400).json({
                    valido: false,
                    error: 'Este código ya fue usado',
                    fecha_uso: codigoInfo.fecha_uso
                });
            }

            res.json({
                valido: true,
                turista_nombre: codigoInfo.turista_nombre,
                lugar_nombre: codigoInfo.lugar_nombre,
                fecha_creacion: codigoInfo.fecha_creacion
            });
        } catch (error) {
            console.error('Error validando código:', error);
            res.status(500).json({ error: 'Error validando código' });
        }
    },

    // POST /api/comercios/mi-negocio/fotos — sube UNA foto a la galería del
    // negocio (se llama una vez por foto desde el frontend). Límite de 8
    // fotos por comercio para no descontrolar el almacenamiento.
    async subirFoto(req, res) {
        try {
            const comercioId = req.user.comercio_id;
            if (!comercioId) {
                return res.status(403).json({ error: 'Esta cuenta no tiene un comercio asociado' });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No se envió ninguna imagen' });
            }

            const conteo = await pool.query(
                'SELECT COUNT(*) AS total FROM comercio_fotos WHERE comercio_id = $1',
                [comercioId]
            );
            if (parseInt(conteo.rows[0].total) >= 8) {
                return res.status(400).json({ error: 'Ya alcanzaste el máximo de 8 fotos. Elimina alguna antes de subir otra.' });
            }

            const resultadoSubida = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'concepcion_comercios', transformation: [{ width: 1000, height: 1000, crop: 'limit' }] },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });

            const result = await pool.query(`
                INSERT INTO comercio_fotos (comercio_id, imagen_url, cloudinary_public_id, orden)
                VALUES ($1, $2, $3, (SELECT COALESCE(MAX(orden), 0) + 1 FROM comercio_fotos WHERE comercio_id = $1))
                RETURNING *
            `, [comercioId, resultadoSubida.secure_url, resultadoSubida.public_id]);

            res.status(201).json({ success: true, foto: result.rows[0] });
        } catch (error) {
            console.error('Error subiendo foto de comercio:', error);
            res.status(500).json({ error: 'Error subiendo foto' });
        }
    },

    // DELETE /api/comercios/mi-negocio/fotos/:fotoId — el dueño borra una
    // de SUS fotos (se verifica que la foto pertenezca a su comercio_id,
    // no solo que exista el id).
    async eliminarFoto(req, res) {
        try {
            const comercioId = req.user.comercio_id;
            const { fotoId } = req.params;

            if (!comercioId) {
                return res.status(403).json({ error: 'Esta cuenta no tiene un comercio asociado' });
            }

            const result = await pool.query(
                'DELETE FROM comercio_fotos WHERE id = $1 AND comercio_id = $2 RETURNING id, cloudinary_public_id',
                [fotoId, comercioId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Foto no encontrada o no te pertenece' });
            }

            // Borrar también el archivo real en Cloudinary. Si esto falla,
            // no bloqueamos la respuesta al usuario (la foto ya no aparece
            // en su galería, que es lo que le importa) — pero sí lo
            // logueamos para poder limpiar manualmente si se acumula.
            const publicId = result.rows[0].cloudinary_public_id;
            if (publicId) {
                cloudinary.uploader.destroy(publicId).catch(err => {
                    console.error(`⚠️ No se pudo borrar de Cloudinary el archivo ${publicId}:`, err.message);
                });
            }

            res.json({ success: true, message: 'Foto eliminada' });
        } catch (error) {
            console.error('Error eliminando foto de comercio:', error);
            res.status(500).json({ error: 'Error eliminando foto' });
        }
    },

    // POST /api/comercios/codigos/:codigo/canjear — marca el código como
    // usado, atado al comercio del usuario logueado (viene del token, no
    // del body, para que un comercio no pueda canjear a nombre de otro).
    async canjearCodigo(req, res) {
        try {
            const { codigo } = req.params;
            const comercioId = req.user.comercio_id;

            if (!comercioId) {
                return res.status(403).json({ error: 'Esta cuenta no tiene un comercio asociado' });
            }

            const canjeado = await CodigoDescuento.canjear(codigo.toUpperCase(), comercioId);

            if (!canjeado) {
                return res.status(400).json({
                    error: 'El código no existe o ya fue usado (puede que otro empleado ya lo haya canjeado justo ahora)'
                });
            }

            res.json({
                success: true,
                message: 'Código canjeado con éxito',
                codigo: canjeado
            });
        } catch (error) {
            console.error('Error canjeando código:', error);
            res.status(500).json({ error: 'Error canjeando código' });
        }
    },

    // Busca un código de este turista, ya canjeado en ESTE comercio, que
    // todavía no se haya usado para una reseña. Devuelve el id del código
    // (para asociarlo a la reseña) o null si no califica.
    async _buscarCodigoDisponibleParaResena(usuarioId, comercioId) {
        const result = await pool.query(`
            SELECT cd.id
            FROM codigos_descuento cd
            WHERE cd.usuario_id = $1
              AND cd.comercio_id = $2
              AND cd.usado = true
              AND NOT EXISTS (
                  SELECT 1 FROM resenas_comercio rc WHERE rc.codigo_descuento_id = cd.id
              )
            LIMIT 1
        `, [usuarioId, comercioId]);
        return result.rows[0]?.id || null;
    },

    // GET /api/comercios/:id/puedo-calificar — para que el frontend sepa si
    // debe mostrar el botón de calificar, sin tener que intentar el POST.
    async puedoCalificar(req, res) {
        try {
            const comercioId = req.params.id;
            const codigoId = await comercioController._buscarCodigoDisponibleParaResena(req.user.id, comercioId);
            res.json({ puede_calificar: !!codigoId });
        } catch (error) {
            console.error('Error verificando si puede calificar:', error);
            res.status(500).json({ error: 'Error verificando calificación' });
        }
    },

    // POST /api/comercios/:id/resenas — crea la reseña. La validación real
    // (código propio, de ESTE comercio, ya canjeado, no usado para reseña
    // antes) se hace en el servidor, no solo en la pantalla.
    async crearResena(req, res) {
        try {
            const comercioId = req.params.id;
            const usuarioId = req.user.id;
            const { calificacion, comentario } = req.body;

            const calificacionNum = parseInt(calificacion);
            if (!calificacionNum || calificacionNum < 1 || calificacionNum > 5) {
                return res.status(400).json({ error: 'La calificación debe ser un número entre 1 y 5' });
            }

            const codigoId = await comercioController._buscarCodigoDisponibleParaResena(usuarioId, comercioId);

            if (!codigoId) {
                return res.status(403).json({
                    error: 'Para calificar este comercio primero debes canjear un código de descuento ahí'
                });
            }

            const result = await pool.query(`
                INSERT INTO resenas_comercio (comercio_id, usuario_id, codigo_descuento_id, calificacion, comentario)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [comercioId, usuarioId, codigoId, calificacionNum, comentario || null]);

            res.status(201).json({ success: true, resena: result.rows[0] });
        } catch (error) {
            console.error('Error creando reseña:', error);
            res.status(500).json({ error: 'Error creando reseña' });
        }
    }
};

module.exports = comercioController;
