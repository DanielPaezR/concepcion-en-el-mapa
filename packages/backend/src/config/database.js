const { Pool } = require('pg');
require('dotenv').config();

// Usar DATABASE_URL (Recomendado para Railway)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: No se encontró DATABASE_URL en las variables de entorno');
  process.exit(1);
}

console.log('🔐 Conectando a PostgreSQL...');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000, // Aumentado a 10 segundos
  max: 20,
  idleTimeoutMillis: 30000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Conexión exitosa a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la conexión a PostgreSQL:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};