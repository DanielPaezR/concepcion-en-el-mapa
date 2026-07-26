const { Pool } = require('pg');
require('dotenv').config();

// En producción (Railway) se usa DATABASE_URL con SSL.
// En desarrollo local se usan las variables sueltas DB_* sin SSL.
const connectionString = process.env.DATABASE_URL;

if (!connectionString && !process.env.DB_HOST) {
  console.error('❌ ERROR: No se encontró DATABASE_URL ni DB_HOST en las variables de entorno');
  process.exit(1);
}

console.log('🔐 Conectando a PostgreSQL...');

const pool = new Pool({
  ...(connectionString
    ? { connectionString, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }),
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