const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false,
  connectionTimeoutMillis: 5000,
  // Forzar autenticación plain text (para probar)
  password: process.env.DB_PASSWORD,
});

console.log('🔐 Intentando conectar con:');
console.log('   Host:', process.env.DB_HOST);
console.log('   User:', process.env.DB_USER);
console.log('   Database:', process.env.DB_NAME);
console.log('   Password length:', process.env.DB_PASSWORD.length);

pool.query('SELECT * FROM lugares LIMIT 1', (err, res) => {
  if (err) {
    console.error('❌ Error:', err.message);
    console.error('Código:', err.code);
    
    // Intentar con un query más simple
    console.log('\n🔄 Intentando query más simple...');
    pool.query('SELECT 1 as test', (err2, res2) => {
      if (err2) {
        console.error('❌ También falló:', err2.message);
      } else {
        console.log('✅ Query simple funcionó:', res2.rows[0]);
      }
      pool.end();
    });
  } else {
    console.log('✅ Conexión exitosa!');
    console.log('📍 Lugares encontrados:', res.rows.length);
    console.log('📋 Primer lugar:', res.rows[0]);
    pool.end();
  }
});