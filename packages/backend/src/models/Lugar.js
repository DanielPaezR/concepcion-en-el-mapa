const db = require('../config/database');

class Lugar {
  // Obtener todos los lugares activos
  static async findAll(activo = true) {
    const query = 'SELECT * FROM lugares WHERE activo = $1 ORDER BY nombre';
    const result = await db.query(query, [activo]);
    return result.rows;
  }

  // Obtener un lugar por ID
  static async findById(id) {
    const query = 'SELECT * FROM lugares WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Crear un nuevo lugar
  static async create(lugarData) {
    const { nombre, descripcion, tipo, latitud, longitud, direccion, imagen_url } = lugarData;
    
    const query = `
      INSERT INTO lugares (nombre, descripcion, tipo, latitud, longitud, direccion, imagen_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [nombre, descripcion, tipo, latitud, longitud, direccion, imagen_url];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Actualizar un lugar
  static async update(id, lugarData) {
    const { nombre, descripcion, tipo, latitud, longitud, direccion, imagen_url, activo } = lugarData;
    
    const query = `
      UPDATE lugares 
      SET nombre = $1, descripcion = $2, tipo = $3, latitud = $4, longitud = $5, 
          direccion = $6, imagen_url = $7, activo = $8, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [nombre, descripcion, tipo, latitud, longitud, direccion, imagen_url, activo, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Eliminar un lugar (soft delete)
  static async delete(id) {
    const query = 'UPDATE lugares SET activo = false WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Buscar lugares por tipo
  static async findByType(tipo) {
    const query = 'SELECT * FROM lugares WHERE tipo = $1 AND activo = true';
    const result = await db.query(query, [tipo]);
    return result.rows;
  }

  // Buscar lugares cercanos
  static async findNearby(lat, lng, radioKm = 5) {
    // Usando la fórmula de Haversine para calcular distancia
    const query = `
      SELECT *, 
        (6371 * acos(cos(radians($1)) * cos(radians(latitud)) * 
        cos(radians(longitud) - radians($2)) + sin(radians($1)) * 
        sin(radians(latitud)))) AS distance 
      FROM lugares 
      WHERE activo = true
      HAVING distance < $3
      ORDER BY distance
    `;
    const result = await db.query(query, [lat, lng, radioKm]);
    return result.rows;
  }
}

module.exports = Lugar;