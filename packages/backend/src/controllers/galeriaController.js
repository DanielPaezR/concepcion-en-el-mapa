const Galeria = require('../models/Galeria');
const LugarEspecial = require('../models/LugarEspecial');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { verificarYOtorgarInsignias } = require('../services/insigniaService');
const pool = require('../config/database');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage() });

const galeriaController = {
    async listar(req, res) {
        try {
            const { limite = 20, offset = 0 } = req.query;
            const fotos = await Galeria.obtenerFotos(parseInt(limite), parseInt(offset));
            res.json({ success: true, fotos });
        } catch (error) {
            console.error('Error al listar fotos:', error);
            res.status(500).json({ error: 'Error al obtener la galería' });
        }
    },

    async subirFoto(req, res) {
        try {
            const { mensaje } = req.body;
            const usuarioId = req.user.id;
            const usuarioResult = await pool.query(
                'SELECT COALESCE(nivel, 1) AS nivel FROM usuarios WHERE id = $1',
                [usuarioId]
            );
            const playerLevel = usuarioResult.rows[0]?.nivel || req.user.nivel || 1;
            
            console.log('📸 Subiendo foto - Usuario:', usuarioId, 'Nivel:', playerLevel);

            const lugarEspecial = await LugarEspecial.obtener();
            if (!lugarEspecial) {
                return res.status(404).json({ error: 'Lugar especial no disponible' });
            }

            if (playerLevel < 5) {
                return res.status(403).json({ 
                    error: `Necesitas alcanzar el nivel 5 para subir fotos. Tu nivel actual es ${playerLevel}`
                });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No se recibió ninguna imagen' });
            }

            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { 
                        folder: 'concepcion_galeria',
                        transformation: [
                            { width: 800, height: 600, crop: 'limit' },
                            { quality: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });

            const foto = await Galeria.subirFoto(usuarioId, lugarEspecial.id, result.secure_url, mensaje);
            const nuevasInsignias = await verificarYOtorgarInsignias(usuarioId);
            
            res.status(201).json({
                success: true,
                message: '¡Foto subida exitosamente!',
                foto,
                nuevas_insignias: nuevasInsignias
            });
        } catch (error) {
            console.error('Error al subir foto:', error);
            res.status(500).json({ error: 'Error al subir la foto' });
        }
    },

    async darLike(req, res) {
        try {
            const { id } = req.params;
            const resultado = await Galeria.darLike(id);
            
            if (!resultado) {
                return res.status(404).json({ error: 'Foto no encontrada' });
            }
            
            res.json({ success: true, likes: resultado.likes });
        } catch (error) {
            console.error('Error al dar like:', error);
            res.status(500).json({ error: 'Error al dar like' });
        }
    },

    async comentar(req, res) {
        try {
            const { id } = req.params;
            const { comentario } = req.body;
            const usuarioId = req.user.id;

            if (!comentario || comentario.trim() === '') {
                return res.status(400).json({ error: 'El comentario no puede estar vacío' });
            }

            const nuevoComentario = await Galeria.comentarFoto(id, usuarioId, comentario);
            
            res.status(201).json({
                success: true,
                message: 'Comentario agregado',
                comentario: nuevoComentario
            });
        } catch (error) {
            console.error('Error al comentar:', error);
            res.status(500).json({ error: 'Error al agregar comentario' });
        }
    },

    async obtenerComentarios(req, res) {
        try {
            const { id } = req.params;
            const comentarios = await Galeria.obtenerComentarios(id);
            res.json({ success: true, comentarios });
        } catch (error) {
            console.error('Error al obtener comentarios:', error);
            res.status(500).json({ error: 'Error al obtener comentarios' });
        }
    },

    upload: upload.single('imagen')
};

module.exports = galeriaController;
