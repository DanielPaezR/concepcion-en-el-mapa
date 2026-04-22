const Lugar = require('../models/Lugar');
const { validationResult } = require('express-validator');

const lugarController = {
  // Obtener todos los lugares
  getAllLugares: async (req, res) => {
    try {
      const lugares = await Lugar.findAll();
      res.json({
        success: true,
        data: lugares
      });
    } catch (error) {
      console.error('Error en getAllLugares:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los lugares',
        error: error.message
      });
    }
  },

  // Obtener un lugar por ID
  getLugarById: async (req, res) => {
    try {
      const { id } = req.params;
      const lugar = await Lugar.findById(id);
      
      if (!lugar) {
        return res.status(404).json({
          success: false,
          message: 'Lugar no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: lugar
      });
    } catch (error) {
      console.error('Error en getLugarById:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el lugar',
        error: error.message
      });
    }
  },

  // Crear un nuevo lugar
  createLugar: async (req, res) => {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const newLugar = await Lugar.create(req.body);
      
      // Registrar métrica de creación (opcional)
      
      res.status(201).json({
        success: true,
        message: 'Lugar creado exitosamente',
        data: newLugar
      });
    } catch (error) {
      console.error('Error en createLugar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el lugar',
        error: error.message
      });
    }
  },

  // Actualizar un lugar
  updateLugar: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si existe
      const existingLugar = await Lugar.findById(id);
      if (!existingLugar) {
        return res.status(404).json({
          success: false,
          message: 'Lugar no encontrado'
        });
      }

      const updatedLugar = await Lugar.update(id, req.body);
      
      res.json({
        success: true,
        message: 'Lugar actualizado exitosamente',
        data: updatedLugar
      });
    } catch (error) {
      console.error('Error en updateLugar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el lugar',
        error: error.message
      });
    }
  },

  // Eliminar un lugar (soft delete)
  deleteLugar: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedLugar = await Lugar.delete(id);
      if (!deletedLugar) {
        return res.status(404).json({
          success: false,
          message: 'Lugar no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Lugar eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en deleteLugar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el lugar',
        error: error.message
      });
    }
  },

  // Obtener lugares por tipo
  getLugaresByTipo: async (req, res) => {
    try {
      const { tipo } = req.params;
      const lugares = await Lugar.findByType(tipo);
      
      res.json({
        success: true,
        data: lugares
      });
    } catch (error) {
      console.error('Error en getLugaresByTipo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener lugares por tipo',
        error: error.message
      });
    }
  },

  // Obtener lugares cercanos
  getLugaresCercanos: async (req, res) => {
    try {
      const { lat, lng, radio } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren latitud y longitud'
        });
      }

      const lugares = await Lugar.findNearby(lat, lng, radio || 5);
      
      res.json({
        success: true,
        data: lugares
      });
    } catch (error) {
      console.error('Error en getLugaresCercanos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener lugares cercanos',
        error: error.message
      });
    }
  }
};

module.exports = lugarController;