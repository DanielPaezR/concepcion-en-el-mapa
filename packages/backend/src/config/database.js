const { Pool } = require('pg');
require('dotenv').config();

// Usar DATABASE_URL si existe, sino usar variables separadas
const connectionString = process.env.DATABASE_URL;

const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000, // ← Aumentado a 10 segundos
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000, // ← Aumentado a 10 segundos
        max: 20,
        idleTimeoutMillis: 30000,
      }
);

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